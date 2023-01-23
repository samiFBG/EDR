import React from "react";
import {getStations, getTimetable, getTrains} from "../api/api";
import {Alert} from "flowbite-react";
import {EDRTable} from "./components/Table";
import _keyBy from "lodash/fp/keyBy";
import _map from "lodash/fp/map";
import {serverTzMap} from "../config";
import {useTranslation} from "react-i18next";
import {console_log} from "../utils/Logger";

import {LoadingScreen} from "./components/LoadingScreen";
import {DetailedTrain, getTrainDetails} from "./functions/trainDetails";
import {postConfig} from "../config/stations";
import { TimeTableServiceType } from "../config/trains";
import { Station, Train } from "@simrail/types";
import { Dictionary } from "lodash";

type Props = {
    serverCode: string;
    post: string;
    playSoundNotification: (cb: () => void) => void
}
/**
 * This component is responsible to get and batch all the data before it goes downstream to the table
 */
export const EDR: React.FC<Props> = ({playSoundNotification, serverCode, post}) => {
    const currentStation = postConfig[post];
    const [loading, setLoading] = React.useState(true);
    const [stations, setStations] = React.useState<Dictionary<Station> | undefined>();
    const [trains, setTrains] = React.useState<Train[] | undefined>();
    const [timetable, setTimetable] = React.useState<TimeTableRow[] | undefined>();
    const [trainsWithDetails, setTrainsWithDetails] = React.useState<{ [k: string]: DetailedTrain } | undefined>();
    const {t} = useTranslation();

    const previousTrains = React.useRef<{ [k: string]: DetailedTrain } | null>(null);

    const serverTz = serverTzMap[serverCode.toUpperCase()] ?? 'Europe/Paris';

    // Gets raw simrail data
    const fetchAllDatas = () => {
        getTimetable(serverCode, post).then((data: TimeTableRow[]) => {
            setTimetable(data);
            getStations(serverCode).then((data) => {
                setStations(_keyBy('Name', data));
                getTrains(serverCode).then((data) => {
                    setTrains(data);
                    setLoading(false);
                });
            }).catch(() => setTimeout(fetchAllDatas, 5000));
        }).catch(() => setTimeout(fetchAllDatas, 5000));
    }

    // Launches the get from simrail
    React.useEffect(() => {
        setLoading(true);
        console_log("Current station : ", currentStation);
        if (!serverCode || !currentStation) return;
        fetchAllDatas();
        // eslint-disable-next-line
    }, [serverCode, post]);

    // Keeps previous data in memory for comparing changes
    React.useEffect(() => {
        previousTrains.current = trainsWithDetails as { [k: string]: DetailedTrain };
    }, [trainsWithDetails]);

    // Refreshes the train positions every 10 seconds
    React.useEffect(() => {
        window.trainsRefreshWebWorkerId = window.setInterval(() => {
            getTrains(serverCode).then(setTrains);
        }, 10000);
        if (!window.trainsRefreshWebWorkerId) {
            alert(t("app.fatal_error"));
            return;
        }
        return () => window.clearInterval(window.trainsRefreshWebWorkerId);
        // eslint-disable-next-line
    }, [serverCode]);

    // Adds all the calculated infos for online trains. Such as distance or closest station for example
    React.useEffect(() => {
        if (loading || (trains as Train[]).length === 0 || !previousTrains) return;
        const keyedStations = _keyBy('Name', stations);
        const addDetailsToTrains = getTrainDetails(previousTrains, post, currentStation, keyedStations);
        const onlineTrainsWithDetails = _map(addDetailsToTrains, trains);

        setTrainsWithDetails(_keyBy('TrainNoLocal', onlineTrainsWithDetails));

        // eslint-disable-next-line
    }, [stations, trains, previousTrains.current, timetable]);

    if (!loading && trains && trains.length === 0) {
        return <Alert className="mt-8" color="error">{t("app.no_trains")}</Alert>
    }

    if (!loading && !timetable) {
        return <Alert color="failure">{t("app.no_timetable")}</Alert>
    }

    if (!loading && !currentStation)
        return <Alert color="failure">{t("app.station_not_found")}</Alert>

    if (loading)
        return <LoadingScreen timetable={timetable as TimeTableRow[]} trains={trains}
                              stations={stations as Dictionary<Station>}/>

    return <EDRTable playSoundNotification={playSoundNotification} timetable={timetable!}
                     serverTz={serverTz} trainsWithDetails={trainsWithDetails as { [k: string]: DetailedTrain }}/>;
}

export type TimeTableRow = {
    k: string;
    scheduled_arrival: string;
    real_arrival: string,
    type: TimeTableServiceType,
    train_number: string,
    from: string,
    to: string,
    line: string,
    layover: string,
    stop_type: string,
    platform: string,
    scheduled_departure: string,
    real_departure: string,
    start_station: string,
    terminus_station: string,
    carrier: string,
    type_speed: number,
    hourSort: number,
    secondaryPostsRows: TimeTableRow[]
};

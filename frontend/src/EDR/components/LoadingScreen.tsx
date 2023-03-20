import React from "react";
import {Spinner} from "flowbite-react";
import {useTranslation} from "react-i18next";
import { TimeTableRow } from "..";
import { Station, Train } from "@simrail/types";
import { Dictionary } from "lodash";
import { ISteamUserList } from "../../config/ISteamUserList";

type Props = {
    timetable: TimeTableRow[];
    trains: Train[] | undefined;
    stations: Dictionary<Station>;
    tzOffset?: number;
    trainSchedules: any;
    players: ISteamUserList | undefined;
}
export const LoadingScreen: React.FC<Props> = ({timetable, trains, stations, tzOffset, trainSchedules, players}: Props) => {
    const {t} = useTranslation();

    return <div className="min-h-screen flex flex-col justify-center items-center text-center">
        <div>{t('EDR_LOADING_main_message')}</div>
        <div>{t("EDR_LOADING_schedules")}: {!timetable ? <Spinner size="xs"/> : <>✓</>}</div>
        <div>{t("EDR_LOADING_stations")}: {!stations ? <Spinner size="xs"/> : <>✓</>}</div>
        <div>{t("EDR_LOADING_trains")}: {!trains ? <Spinner size="xs"/> : <>✓</>}</div>
        <div>{t("EDR_LOADING_timezone")}: {tzOffset === undefined ? <Spinner size="xs"/> : <>✓</>}</div>
        <div>{t("EDR_LOADING_trains_schedules")}: {!trainSchedules ? <Spinner size="xs"/> : <>✓</>}</div>
        <div>{t("EDR_LOADING_players")}: {!players ? <Spinner size="xs"/> : <>✓</>}</div>
    </div>
}
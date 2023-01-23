import React from "react";
import {SelectMenuLayout} from "./Layout";
import {StringParam, useQueryParam} from "use-query-params";
import {getStations} from "../api/api";
import {Spinner} from "flowbite-react";
import {PostCard} from "./PostCard";
import {useTranslation} from "react-i18next";
import { Station } from "@simrail/types";

export const PostSelect = () => {
    const [posts, setPosts] = React.useState<Station[] | undefined>();
    const [serverCode] = useQueryParam('serverCode', StringParam);
    const {t} = useTranslation();

    React.useEffect(() => {
        if (!serverCode) return;
        getStations(serverCode).then(setPosts);
        // eslint-disable-next-line
    }, []);

    return <SelectMenuLayout title={t("select_menu.post_select")}>
        {
            !posts
            ? <Spinner size="xl"/>
            : posts.map((post) => <PostCard key={post.Prefix} post={post} />)
        }
    </SelectMenuLayout>;
}
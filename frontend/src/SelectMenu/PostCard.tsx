import React from "react";
import {Card} from "flowbite-react";
import {StringParam, useQueryParam} from "use-query-params";
import {optimizedPostsImagesMap} from "../config";
import classNames from "classnames";
import {postToInternalIds} from "../config/stations";

export const PostCard: React.FC<any> = ({post}) => {
    const [, setPostParam] = useQueryParam('post', StringParam);
    const realId = postToInternalIds[encodeURIComponent(post.Name)]?.id;

    if (!realId) return null;
    return (
        <Card className={classNames("m-4 max-w-[200px]", {"cursor-pointer": !!realId})} imgSrc={optimizedPostsImagesMap[post.Prefix.toUpperCase() as string]} style={{opacity: realId ? 1 : 0.3}} onClick={() => {
            if (!realId) return;
            setPostParam(realId);
            window.history.go();
        }}>
            {post.Name}
        </Card>
    )
}

import Link from "next/link"
import InfiniteScroll from "react-infinite-scroll-component"
import { ProfileImage } from "./ProfileImage"
import { useSession } from "next-auth/react"
import {VscHeart, VscHeartFilled} from 'react-icons/vsc'
import { IconHoverEffect } from "./IconHoverEffect"
import { api } from "~/utils/api"
import { LoadingSpinner } from "./LoadingSpinner"

type Post = {
    id:string
    content: string
    createdAt: Date
    likeCount: number
    likedByMe: boolean
    user: {id: string, image: string | null, name: string | null}
}

type InfinitePostListProps = {
    isLoading: boolean
    isError: boolean
    hasMore: boolean | undefined
    fetchNewPosts: () => Promise<unknown>
    posts?: Post[]
}

export const InfinitePostList = ({posts, isError, isLoading, fetchNewPosts, hasMore=false} : InfinitePostListProps) => {
    if(isLoading) return <LoadingSpinner />
    if(isError) return <h1>Error...</h1>
    if(posts == null || posts.length == 0) return <h1 className="flex justify-center p-2 text-slate-400 font-bold">No Posts</h1>

    return <ul>
        <InfiniteScroll dataLength={posts.length} next={fetchNewPosts} hasMore={hasMore} loader={<LoadingSpinner />}>
            {
                posts.map(post => {
                    return (
                        <PostCard key={post.id} {...post} />
                    )
                })
            }
        </InfiniteScroll>
    </ul>
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {dateStyle: "short"})

const PostCard = ({id, user, content, createdAt, likeCount, likedByMe}:Post) => {
    const trpcUtils = api.useContext()
    const toggleLike = api.post.toggleLike.useMutation({onSuccess: (data) => {
        // TODO: FIX THIS ERROR
        const updateData: Parameters<typeof trpcUtils.post.infiniteFeed.setInfiniteData>[1] = (oldData) => {
            if(oldData == null) return 
            const countModifier = data.addedLike ? 1:-1
            return {
                ...oldData,
                pages: oldData.pages.map(page=>{
                    return {
                        ...page,
                        posts: page.posts.map(post => {
                            if(post.id === id){
                                return {
                                    ...post,
                                    likeCount: post.likeCount + countModifier,
                                    likedByMe: data.addedLike
                                }
                            }
                            return post
                        })
                    }
                })
            }
        }

        trpcUtils.post.infiniteFeed.setInfiniteData({}, updateData);
        trpcUtils.post.infiniteFeed.setInfiniteData({onlyFollowing: true}, updateData);
        trpcUtils.post.infiniteProfileFeed.setInfiniteData({userId: user.id}, updateData);
    }})
    const handleToggleLike = () => {
        toggleLike.mutate({id})
    }
    return <li className="flex gap-4 border-b px-4 py-4">
        <Link href={`/profiles/${user.id}`}> <ProfileImage src={user.image} /> </Link>
        <div className="flex flex-grow flex-col">
            <div className="flex gap-1 text-sm">
                <Link href={`/profiles/${user.id}`} className="font-bold hover:underline hover:underline-offset-4 focus-visible:underline">{user.name}</Link>
                <span className="text-gray-500">-</span>
                <span className="text-gray-500">{dateTimeFormatter.format(createdAt)}</span>
            </div>
            <p className="whitespace-pre-wrap">{content}</p>
            <HeartButton onClick={handleToggleLike} isLoading={toggleLike.isLoading} likedByMe={likedByMe} likeCount={likeCount} />
        </div>
    </li>
}

type HeartButtonProps = {
    onClick: () => void
    isLoading: boolean
    likedByMe: boolean
    likeCount: number
}

function HeartButton({onClick,isLoading, likedByMe, likeCount}:HeartButtonProps){
    const session = useSession()
    const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;

    if(session.status !== "authenticated"){
        return <div className="mb-1 mt-1 flex items-center gap-3 self-start">
            <HeartIcon />
            <span>{likeCount}</span>
        </div>
    }
    return <button disabled={isLoading} onClick={onClick} className={`group items-center gap-1 self-start flex transition-colors duration-200 ${likedByMe ? "text-red-500" : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"} -ml-2`}>
            <div className="mb-1 mt-1 flex items-center gap-3 self-start">
                <IconHoverEffect red>
                    <HeartIcon className={`transition-colors duration-200 ${likedByMe ? "fill-red-500" : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"}`} />
                </ IconHoverEffect>
            </div>
            <span>{likeCount}</span>
        </button>
}
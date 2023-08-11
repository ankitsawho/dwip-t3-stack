import type { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from "next";
import { useSession } from "next-auth/react";
import Error from "next/error";
import Head from "next/head";
import Link from "next/link";
import { VscArrowLeft } from "react-icons/vsc";
import { CustomButton } from "~/components/CustomButton";
import { IconHoverEffect } from "~/components/IconHoverEffect";
import { InfinitePostList } from "~/components/InfinitePostList";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { ProfileImage } from "~/components/ProfileImage";
import { ssgHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({id}) => {
    const {data: profile} = api.profile.getById.useQuery({id})
    const posts = api.post.infiniteProfileFeed.useInfiniteQuery({userId: id}, {
        getNextPageParam: (lastPage) => lastPage.nextCursor
    })
    const trpcUtils = api.useContext()
    const toggleFollow = api.profile.toggleFollow.useMutation({onSuccess: ({addedFollow}) => {
        trpcUtils.profile.getById.setData({id}, (oldData) => {
            if(oldData == null) return null
            const countModifier = addedFollow ? 1 : -1;
            return {
                ...oldData,
                isFollowing: addedFollow,
                followersCount: oldData.followersCount + countModifier
            }
        })
    }})
    if(profile == null || profile.name == null) return <LoadingSpinner />
    return <>
        <Head>
            <title>{`${profile.name} | Dwip Social`}</title>
        </Head>
        <header className="sticky top-0 z-10 flex items-center border-b bg-white px-4 py-2">
            <Link href=".." className="mr-2">
                <IconHoverEffect>
                    <VscArrowLeft className="h-6 w-6" />
                </IconHoverEffect>
            </Link>
                <ProfileImage src={profile.image} className="flex-shirk-0" />
                <div className="ml-2 flex-grow">
                    <h1 className="text-lg font-bold">
                        {profile.name}
                    </h1>
                    <div className="text-gray-500 flex gap-4">
                        <div className="text-gray-500">{profile.postsCount}{" "}{getPlural(profile.postsCount, "Dwip", "Dwips")}</div>
                        <div className="text-gray-500">{profile.followsCount}{" "} Following</div>
                        <div className="text-gray-500">{profile.followersCount}{" "}{getPlural(profile.postsCount, "Follower", "Followers")}</div>
                    </div>
                </div>
            <FollowButton isLoading={toggleFollow.isLoading} isFollowing={profile.isFollowing} userId={id} onClick={()=>toggleFollow.mutate({userId: id})} />
        </header>
        <main>
            <InfinitePostList posts={posts.data?.pages.flatMap(page => page.posts)} isError={posts.isError} isLoading={posts.isLoading} hasMore={posts.hasNextPage} fetchNewPosts={posts.fetchNextPage} />
        </main>
    </>
}
const FollowButton = ({userId, isFollowing, onClick, isLoading} : {userId: string, isFollowing: boolean, isLoading: boolean,onClick: () => void})  => {
    const session = useSession()
    if(session.status !== "authenticated" || session.data.user.id === userId) {
        return null
    }
    return <CustomButton disabled={isLoading} onClick={onClick} small gray={isFollowing} >
        {isFollowing ? "Unfollow" : "Follow"}
    </CustomButton>
}

export const getStaticPaths: GetStaticPaths = () => {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export async function getStaticProps(context: GetStaticPropsContext<{id: string}>){
    const id = context.params?.id
    if(id == null){
        return {
            redirect: {
                destination: "/"
            }
        }
    }

    const ssg = ssgHelper()
    await ssg.profile.getById.prefetch({id})

    return {
        props: {
            id,
            trpcState: ssg.dehydrate()
        }
    }
}
const pluralRules = new Intl.PluralRules()
const getPlural=(number: number, singular: string, plural: string) => {
    return pluralRules.select(number) === "one" ? singular : plural
}

export default ProfilePage
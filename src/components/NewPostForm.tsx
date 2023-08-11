import { useSession } from "next-auth/react"
import { CustomButton } from "./CustomButton"
import { ProfileImage } from "./ProfileImage"
import { FormEvent, useCallback, useLayoutEffect, useRef, useState } from "react"
import { api } from "~/utils/api"

const updateTextAreaSize = (textarea? : HTMLTextAreaElement) => {
    if(textarea == null) return
    textarea.style.height = "0"
    textarea.style.height = `${textarea.scrollHeight}px`
}

export const NewPostForm = () => {
    const session = useSession()
    if(session.status !== "authenticated") return;

    return <Form />
}

export const Form = () => {
    const session = useSession()
    if(session.status !== "authenticated") return
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const [inputValue, setInputValue] = useState("")
    const inputRef = useCallback((textArea:HTMLTextAreaElement) => {
        updateTextAreaSize(textArea)
        textAreaRef.current = textArea
    }, [])

    const trpcUtils = api.useContext()

    useLayoutEffect(() => {
        if(inputValue && textAreaRef.current)
        updateTextAreaSize(textAreaRef.current)
    }, [inputValue])

    const createPost = api.post.create.useMutation({onSuccess: newPost => {
        console.log(newPost);
        setInputValue("")
        if(session.status !== "authenticated") return
        // TODO: Fix this error
        trpcUtils.post.infiniteFeed.setInfiniteData({}, (oldData) => {
            if(oldData == null || oldData.pages[0] == null) return
            const newCachePost = {
                ...newPost,
                likeCount: 0,
                likedByMe: false,
                user: {
                    id: session.data.user.id,
                    name: session.data.user.name,
                    image: session.data.user.image
                }
            }
            return {
                ...oldData,
                pages: [{
                    ...oldData.pages[0],
                    posts: [newCachePost, ...oldData.pages[0].posts]
                },
                    ...oldData.pages.slice(1)
                ]
            }
        })
    }});

    if(session.status !== "authenticated") return null;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        createPost.mutate({content: inputValue})
    }

    return <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-b px-4 py-2">
        <div className="flex justify-center items-center">
            <ProfileImage src={session.data.user.image} />
            <textarea ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)} style={{height: 0}} className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none" placeholder="What's happening?"/>
        </div>
        <div className="flex justify-end">
        <CustomButton>Post</CustomButton>
        </div>
    </form>
}
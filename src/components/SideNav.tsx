import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { IconHoverEffect } from "./IconHoverEffect"
import { VscAccount, VscHome, VscSignIn, VscSignOut } from "react-icons/vsc"

export const SideNav = () => {
    const session = useSession()
    const user = session.data?.user

    return <nav className="sticky top-0 px-2 py-4">
        <ul className="flex flex-col justify-center items-start gap-2 whitespace-nowrap">
            <li>
                <Link href='/'>
                    <IconHoverEffect>
                        <span className="flex items-center gap-2">
                            <VscHome className="h-8 w-8" />
                            <span className="hidden text-lg md:inline">Home</span>
                        </span>
                    </IconHoverEffect>
                </Link>
            </li>
            {
                user != null && (
                    <li>
                        <Link href={`/profiles/${user?.id}`}>
                        <IconHoverEffect>
                        <span className="flex items-center gap-2">
                            <VscAccount className="h-7 w-7" />
                            <span className="hidden text-lg md:inline">Profile</span>
                        </span>
                    </IconHoverEffect>
                        </Link>
                    </li>
                )
            }
            {
                user == null ? 
                <li>
                    <button onClick={() => void signIn()}>
                    <IconHoverEffect>
                        
                        <span className="flex items-center gap-2">
                        <VscSignIn className="h-7 w-7" />
                            <span className="hidden text-lg md:inline">Login</span>
                        </span>
                    </IconHoverEffect>
                    </button>
                </li> :  
                <li>
                    <button onClick={() => void signOut()}>
                    <IconHoverEffect>
                        <span className="flex items-center gap-2">
                        <VscSignIn className="h-7 w-7" />

                            <span className="hidden text-lg md:inline">Logout</span>
                        </span>
                    </IconHoverEffect>
                    </button>
                </li>
            }
        </ul>
    </nav>
}
import Image from "next/image"
import { VscAccount } from "react-icons/vsc"

type ProfileImageProps = {
    src? : string | null
    className? : string
}

export const ProfileImage = ({src, className=""}:ProfileImageProps) => {
    return (
        <div className={`relative h-12 w-12 overflow-hidden rounded-full ${className}`}>
            {
                src == null ? <VscAccount className="w-full h-full" /> : <Image src={src} alt="Profile image" quality={75} fill /> 
            }
        </div>
    )
}
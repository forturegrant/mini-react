// @ts-nocheck
import React, { useImperativeHandle, useRef, useEffect, forwardRef } from "react";

const Father = () => {
    const sonRef = useRef();
    useEffect(() => {
        sonRef.current.logSon();
        // sonRef.current.focus();

        console.log(sonRef.current.valueSon, 'sonRef.current.valueSon');
    }, [])
    return <Son ref={sonRef} />
}

const Son = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => {
        return {
            logSon: () => {
                console.log('子组件的打印');
            },
            valueSon: 2
        }
    })
    return <div>
        <input ref={ref} />
    </div>
})

// const Son = forwardRef((props, ref) => {
//     return <div>
//         <input ref={ref} />
//     </div>
// })

export default Father;

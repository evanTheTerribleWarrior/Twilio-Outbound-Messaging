import React, {useState} from 'react';
import MessageScheduler from './MessageScheduler/MessageScheduler';
import LinkShortening from './LinkShortening/LinkShortening';

const MessageOptions = () => {

    return(<>
        <LinkShortening/>
        <MessageScheduler/>
    </>)
}

export default MessageOptions;
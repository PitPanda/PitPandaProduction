import React, { useState } from 'react';
import StaticCard from '../Cards/StaticCard';

function Signatures(props){
    const sigs = [
        {
            path: '/api/images/level/',
            name: 'Level',
        },
        {
            path: '/api/images/profile/',
            name: 'Profile',
        },
    ];
    const [fieldPlayer, setFieldPlayer] = useState('McPqndq');
    const [targetPlayer, setTargetPlayer] = useState('McPqndq');

    const onChange = e => setFieldPlayer(e.target.value);
    const onKeyDown = e => {
        if(e.keyCode === 13) setTargetPlayer(fieldPlayer);
    };
    const onClick = () => setTargetPlayer(fieldPlayer);

    return (
        <div style={{ margin:'auto', width:'1020px' }}>
            <div id="search-header" style={{ textAlign:'center' }}>
                <h1 className="page-header">Signature Generator</h1>
            </div>
            <div style={{ display:'inline-block', marginRight:'20px', width:'350px' }}>
                <StaticCard title='Player'>
                    <input
                        type="text"
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        value={fieldPlayer}
                        style={{
                            width:'75%',
                            fontSize: '16px',
                            fontFamily: 'minecraftia',
                            padding:'5px',
                            color: '#aaa',
                            border: 'none',
                            backgroundColor: '#333333',
                        }}
                    />
                    <input
                        type='button'
                        onClick={onClick}
                        value='GO'
                        style={{
                            marginLeft: '3%',
                            width:'22%',
                            fontSize: '16px',
                            padding:'5px',
                            color: 'white',
                            border: 'none',
                            backgroundColor: 'rgb(221,159,78)',
                            WebkitAppearance: 'none',
                        }}
                    />
                </StaticCard>
                <StaticCard title="About">
                    So pretty much just put the text in your forum signature
                </StaticCard>
            </div>
            <div style={{ display:'inline-block', verticalAlign:'top', width:'650px' }}>
                {sigs.map(sig=>(
                    <StaticCard title={sig.name} key={sig.name+targetPlayer}>
                        <code style={{
                            display:'block', 
                            backgroundColor:'#444', 
                            padding:'3px', 
                            borderRadius:'3px',
                            color: '#fff',
                            marginBottom: '16px',
                            fontSize: '12px',
                        }}>[URL='https://pitpanda.rocks/players/{targetPlayer}'][IMG]https://pitpanda.rocks{sig.path}{targetPlayer}[/IMG][/URL]</code>
                        <img src={sig.path+targetPlayer} alt={sig.name} />
                    </StaticCard>
                ))}
            </div>
        </div>
    );
}

export default Signatures;
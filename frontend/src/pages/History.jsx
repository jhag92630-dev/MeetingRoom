import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/Authcontext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { IconButton } from '@mui/material';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(Array.isArray(history) ? history : []);
            } catch {
                setMeetings([]);
                // IMPLEMENT SNACKBAR
            }
        };

        fetchHistory();
    }, [getHistoryOfUser]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return 'N/A';

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    return (
        <div>
            <IconButton onClick={() => routeTo('/home')}>
                <HomeIcon />
            </IconButton>

            {meetings.length > 0 ? meetings.map((e, i) => (
                <Card key={e._id || i} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                            Code: {e.meetingCode || e.meetingcode || 'Unknown'}
                        </Typography>

                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                            Date: {formatDate(e.date)}
                        </Typography>
                    </CardContent>
                </Card>
            )) : <></>}
        </div>
    )
}


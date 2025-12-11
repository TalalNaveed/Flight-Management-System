import { Box, Container, Grid, Card, CardContent, Typography, Button, List, ListItem, ListItemText, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FlightTakeoff, Search, Star, Flight } from '@mui/icons-material';
import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import { getCustomerTickets } from '../../services/mockApi'; 
import { useAuth } from '../../context/AuthContext';

export default function CustomerDashboard() {
  const [upcomingFlights, setUpcomingFlights] = useState<any[]>([]);
  const [previousFlights, setPreviousFlights] = useState<any[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadFlights = async () => {
      if (!user?.email) return;

      try {
        const data = await getCustomerTickets();

        const now = new Date();
        console.log('Current time (now):', now, 'ISO:', now.toISOString());

        // Helper: parse MySQL datetime "YYYY-MM-DD HH:MM:SS" into a JS Date (local)
        const parseMySQLDateTime = (s: string) => {
          if (!s) return null
          // Accept either 'YYYY-MM-DD HH:MM:SS' or ISO-like strings
          // Try strict parse first
          const isoLike = s.replace(' ', 'T')
          const d = new Date(isoLike)
          if (!isNaN(d.getTime())) return d

          // Fallback: manual parse
          const m = s.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/)
          if (!m) return null
          const [, y, mo, da, hh, mm, ss] = m
          return new Date(Number(y), Number(mo) - 1, Number(da), Number(hh), Number(mm), Number(ss))
        }

        const tickets = (data.tickets || []).map((t: any) => ({
          ...t,
          _depDateObj: t.depDatetime ? parseMySQLDateTime(t.depDatetime) : null,
        }));

        // Filter: upcoming = dep date is strictly in the future (> now)
        const upcoming = tickets.filter((t: any) => {
          if (!t._depDateObj) return false;
          const isUpcoming = t._depDateObj > now;
          console.log(`Flight ${t.flightNumber} (${t.airline}): dep=${t._depDateObj.toISOString()}, now=${now.toISOString()}, isUpcoming=${isUpcoming}`);
          return isUpcoming;
        });

        // Filter: previous = dep date is in the past or now (<= now), sorted by most recent first
        const previous = tickets
          .filter((t: any) => t._depDateObj && t._depDateObj <= now)
          .sort((a: any, b: any) => (b._depDateObj as Date).getTime() - (a._depDateObj as Date).getTime());

        console.log(`✅ Summary: Upcoming=${upcoming.length}, Previous=${previous.length}`);
        setUpcomingFlights(upcoming.slice(0, 3));
        setPreviousFlights(previous.slice(0, 5));
      } catch (err) {
        console.error('Failed to load flights', err);
      }
    };

    loadFlights();
  }, [user]);

  return (
    <>
      <Navbar />
      <Box
        sx={{
          background: 'linear-gradient(135deg, #003366 0%, #0099cc 100%)',
          color: 'white',
          py: 6,
          mb: 4,
        }}
      >
        <Container>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
            Welcome Back! 👋
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Manage your flights and discover new destinations
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              title: 'My Flights',
              backgroundColor: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              icon: <FlightTakeoff sx={{ fontSize: 40, color: '#1976d2' }} />,
              action: () => navigate('/customer/flights'),
              actionLabel: 'View All',
              actionVariant: 'contained' as const,
              color: 'primary' as const,
            },
            {
              title: 'Search Flights',
              backgroundColor: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
              icon: <Search sx={{ fontSize: 40, color: '#7b1fa2' }} />,
              action: () => navigate('/search'),
              actionLabel: 'Search Now',
              actionVariant: 'contained' as const,
              color: 'secondary' as const,
            },
            {
              title: 'Rate Flights',
              backgroundColor: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
              icon: <Star sx={{ fontSize: 40, color: '#f57c00' }} />,
              action: () => navigate('/customer/ratings'),
              actionLabel: 'Rate Now',
              actionVariant: 'contained' as const,
              color: 'warning' as const,
            },
          ].map((card, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Fade in timeout={800 + idx * 200}>
                <Card
                  sx={{
                    background: card.backgroundColor,
                    borderRadius: 3,
                    boxShadow: 4,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8,
                    },
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>{card.icon}</Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {card.title}
                    </Typography>
                    {card.value !== undefined && (
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
                        {card.value}
                      </Typography>
                    )}
                    <Button
                      size="medium"
                      variant={card.actionVariant}
                      color={card.color}
                      fullWidth
                      sx={{
                        mt: 1,
                        borderRadius: 2,
                        fontWeight: 600,
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 4,
                        },
                      }}
                      onClick={card.action}
                    >
                      {card.actionLabel}
                    </Button>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Upcoming Flights Section */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: 4,
            background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Flight sx={{ fontSize: 32, color: '#003366', mr: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#003366' }}>
                Upcoming Flights
              </Typography>
            </Box>

            {upcomingFlights.length > 0 ? (
              <List>
                {upcomingFlights.map((flight, idx) => (
                  <Fade in timeout={1000 + idx * 200} key={flight.id}>
                    <ListItem
                      sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'white',
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 4,
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#003366' }}>
                            {flight.airline} {flight.flightNumber}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="textSecondary">
                            {flight.depAirport} → {flight.arrAirport} • {flight._depDateObj ? flight._depDateObj.toLocaleDateString() : 'Unknown'}
                          </Typography>
                        }
                      />
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                        ${flight.price}
                      </Typography>
                    </ListItem>
                  </Fade>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                  No upcoming flights. Start exploring!
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/search')}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  Search Flights
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Previous Flights Section */}
        <Card sx={{ mt: 4, borderRadius: 3, boxShadow: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Flight sx={{ fontSize: 32, color: '#666', mr: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
                Previous Flights
              </Typography>
            </Box>

            {previousFlights.length > 0 ? (
              <List>
                {previousFlights.map((flight, idx) => (
                  <Fade in timeout={800 + idx * 150} key={flight.id}>
                    <ListItem
                      sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'white',
                        boxShadow: 2,
                        '&:hover': { boxShadow: 4 },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                            {flight.airline} {flight.flightNumber}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="textSecondary">
                            {flight.depAirport} → {flight.arrAirport} • {flight._depDateObj ? flight._depDateObj.toLocaleDateString() : ''}
                          </Typography>
                        }
                      />
                      <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 700 }}>
                        ${flight.price}
                      </Typography>
                    </ListItem>
                  </Fade>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="textSecondary">
                  No previous flights.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

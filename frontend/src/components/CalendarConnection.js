import React, { useState, useEffect } from 'react';
import calendarService from '../services/calendarService';

const CalendarConnection = ({ onCalendarConnected, onClose }) => {
  const [connectedCalendars, setConnectedCalendars] = useState({});
  const [connecting, setConnecting] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setConnectedCalendars(calendarService.getConnectedCalendars());
  }, []);

  const handleConnectGoogle = async () => {
    setConnecting('google');
    setError('');
    
    try {
      const result = await calendarService.connectGoogleCalendar();
      if (result.success) {
        setConnectedCalendars(calendarService.getConnectedCalendars());
        onCalendarConnected && onCalendarConnected('google', result.user);
      } else {
        setError(`Google Calendar connection failed: ${result.error}`);
      }
    } catch (error) {
      setError(`Google Calendar connection failed: ${error.message}`);
    } finally {
      setConnecting(null);
    }
  };

  const handleConnectOutlook = async () => {
    setConnecting('outlook');
    setError('');
    
    try {
      const result = await calendarService.connectOutlookCalendar();
      if (result.success) {
        setConnectedCalendars(calendarService.getConnectedCalendars());
        onCalendarConnected && onCalendarConnected('outlook', result.user);
      } else {
        setError(`Outlook Calendar connection failed: ${result.error}`);
      }
    } catch (error) {
      setError(`Outlook Calendar connection failed: ${error.message}`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = (provider) => {
    calendarService.disconnectCalendar(provider);
    setConnectedCalendars(calendarService.getConnectedCalendars());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Connect Calendar</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Connect your calendar to automatically schedule interviews and send invites to candidates.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Google Calendar */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM12 17.25l-4.5-4.5 1.06-1.06L12 15.19l3.44-3.5L16.5 12.75 12 17.25z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Google Calendar</h4>
                    {connectedCalendars.google?.connected ? (
                      <p className="text-sm text-green-600">Connected as {connectedCalendars.google.email}</p>
                    ) : (
                      <p className="text-sm text-gray-500">Not connected</p>
                    )}
                  </div>
                </div>
                
                {connectedCalendars.google?.connected ? (
                  <button
                    onClick={() => handleDisconnect('google')}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={handleConnectGoogle}
                    disabled={connecting === 'google'}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium flex items-center"
                  >
                    {connecting === 'google' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Outlook Calendar */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 9h10v6H7V9zm5-7C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Outlook Calendar</h4>
                    {connectedCalendars.outlook?.connected ? (
                      <p className="text-sm text-green-600">Connected as {connectedCalendars.outlook.email}</p>
                    ) : (
                      <p className="text-sm text-gray-500">Not connected</p>
                    )}
                  </div>
                </div>
                
                {connectedCalendars.outlook?.connected ? (
                  <button
                    onClick={() => handleDisconnect('outlook')}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={handleConnectOutlook}
                    disabled={connecting === 'outlook'}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium flex items-center"
                  >
                    {connecting === 'outlook' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {Object.keys(connectedCalendars).some(key => connectedCalendars[key]?.connected) && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-700 font-medium">
                  Calendar connected! You can now schedule interviews.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarConnection;

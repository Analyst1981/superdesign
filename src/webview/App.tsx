import React, { useState, useEffect } from 'react';
import ChatInterface from './components/Chat/ChatInterface';
import CanvasView from './components/CanvasView';
import SettingsPage from './components/SettingsPage';
import TemplateDemo from './components/TemplateDemo';
import { WebviewContext } from '../types/context';

// Import CSS as string for esbuild
import styles from './App.css';

type ViewType = 'chat' | 'canvas' | 'settings' | 'template-demo';

const App: React.FC = () => {
    console.log('🚀 App component starting...');
    
    const [vscode] = useState(() => {
        console.log('📞 Acquiring vscode API...');
        return acquireVsCodeApi();
    });
    
    const [context, setContext] = useState<WebviewContext | null>(null);
    const [currentView, setCurrentView] = useState<ViewType>('chat');
    const [nonce, setNonce] = useState<string | null>(null);

    useEffect(() => {
        console.log('🔄 App useEffect running...');
        
        // Detect which view to render based on data-view attribute
        const rootElement = document.getElementById('root');
        console.log('📍 Root element:', rootElement);
        
        const viewType = rootElement?.getAttribute('data-view');
        const nonceValue = rootElement?.getAttribute('data-nonce');
        
        console.log('🎯 View type detected:', viewType);
        console.log('🔐 Nonce value:', nonceValue);
        
        if (nonceValue) {
            setNonce(nonceValue);
            console.log('✅ Nonce set:', nonceValue);
        }

        if (viewType === 'canvas') {
            setCurrentView('canvas');
            console.log('🎨 Switching to canvas view');
        } else if (viewType === 'settings') {
            setCurrentView('settings');
            console.log('⚙️ Switching to settings view');
        } else if (viewType === 'template-demo') {
            setCurrentView('template-demo');
            console.log('📝 Switching to template demo view');
        } else {
            setCurrentView('chat');
            console.log('💬 Switching to chat view');
        }

        // Inject CSS styles
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
        console.log('🎨 CSS styles injected');

        // Get context from window (only needed for chat interface)
        const webviewContext = (window as any).__WEBVIEW_CONTEXT__;
        console.log('🌐 Webview context from window:', webviewContext);
        
        if (webviewContext) {
            setContext(webviewContext);
            console.log('✅ Context set:', webviewContext);
        } else {
            console.log('⚠️ No webview context found in window');
        }

        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    const renderView = () => {
        console.log('🖼️ Rendering view, currentView:', currentView);
        
        switch (currentView) {
            case 'canvas':
                console.log('🎨 Rendering CanvasView with vscode:', !!vscode, 'nonce:', nonce);
                try {
                    // Canvas view doesn't need context - it gets data from extension directly
                    return <CanvasView vscode={vscode} nonce={nonce} />;
                } catch (error) {
                    console.error('❌ Error rendering CanvasView:', error);
                    return <div>Error rendering canvas: {String(error)}</div>;
                }
            case 'settings':
                console.log('⚙️ Rendering SettingsPage');
                try {
                    return <SettingsPage vscode={vscode} />;
                } catch (error) {
                    console.error('❌ Error rendering SettingsPage:', error);
                    return <div>Error rendering settings: {String(error)}</div>;
                }
            case 'template-demo':
                console.log('📝 Rendering TemplateDemo');
                try {
                    return <TemplateDemo />;
                } catch (error) {
                    console.error('❌ Error rendering TemplateDemo:', error);
                    return <div>Error rendering template demo: {String(error)}</div>;
                }
            case 'chat':
            default:
                console.log('💬 Rendering ChatInterface, context:', !!context);
                // Chat interface needs context
                if (!context) {
                    console.log('⏳ Context not ready, showing loading...');
                    return <div>Loading...</div>;
                }
                try {
                    return (
                        <ChatInterface 
                            layout={context.layout}
                            vscode={vscode}
                        />
                    );
                } catch (error) {
                    console.error('❌ Error rendering ChatInterface:', error);
                    return <div>Error rendering chat: {String(error)}</div>;
                }
        }
    };

    console.log('🔄 App rendering, currentView:', currentView);

    return (
        <div className={`superdesign-app ${currentView}-view ${context?.layout ? `${context.layout}-layout` : ''}`}>
            {renderView()}
        </div>
    );
};

export default App;
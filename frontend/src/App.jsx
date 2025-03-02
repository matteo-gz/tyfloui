import {useState, useEffect} from 'react';
import './App.css';
import {StartProxy, StopProxy} from "../wailsjs/go/main/App";

function App() {
    const [formData, setFormData] = useState({
        sshKey: '',
        sshHost: '',
        sshPort: '',
        sshUser: '',
        socks5Port: '',
        isOpen: false
    });
    const [sshKeyFileName, setSshKeyFileName] = useState('');

    // 组件加载时从 localStorage 加载数据并获取当前状态
    useEffect(() => {
        const savedData = localStorage.getItem('sshConfig');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setFormData(parsedData);
            setSshKeyFileName(parsedData.sshKeyFileName || '');
        }
        
        // 获取当前状态
        updateStatus();
    }, []);

    // 定期更新状态
    useEffect(() => {
        const timer = setInterval(updateStatus, 2000); // 每2秒更新一次状态
        return () => clearInterval(timer);
    }, []);

    // 更新状态的函数
    const updateStatus = async () => {
        
    };

    // 处理文件选择
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const content = await file.text();
                const newFormData = { 
                    ...formData, 
                    sshKey: content,
                    sshKeyFileName: file.name
                };
                setFormData(newFormData);
                setSshKeyFileName(file.name);
                localStorage.setItem('sshConfig', JSON.stringify(newFormData));
            } catch (error) {
                console.error('读取文件失败:', error);
            }
        }
    };

    // 处理输入变化
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // 对端口字段进行数字验证
        if ((name === 'sshPort' || name === 'socks5Port')) {
            // 只允许输入数字
            if (!/^\d*$/.test(value)) {
                return;
            }
            // 限制端口范围在 1-65535
            if (value !== '' && (parseInt(value) < 1 || parseInt(value) > 65535)) {
                return;
            }
        }
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);
        // 自动保存到 localStorage
        localStorage.setItem('sshConfig', JSON.stringify(newFormData));
    };

    async function handleToggle(action) {
        try {
            if (action === '开启') {
                let result = await StartProxy({
                    sshKey: formData.sshKey,
                    sshHost: formData.sshHost,
                    sshPort: parseInt(formData.sshPort),
                    sshUser: formData.sshUser,
                    socks5Port: parseInt(formData.socks5Port)
                });
                console.log(result);
            } else {
                await StopProxy();
            }
            // 更新状态
            await updateStatus();
        } catch (error) {
            console.error('操作失败:', error);
        }
    }

    return (
        <div id="App">
            <div id="input" className="input-box">
                 <div className="form-group">
                     <label>SSH私钥:</label>
                     <div className="file-input-container">
                         <input 
                             type="file"
                             id="sshKeyFile"
                             onChange={handleFileSelect}
                             style={{ display: 'none' }}
                             accept=".pem,.key,.pub"
                         />
                         <input 
                             type="text"
                             className="input"
                             value={sshKeyFileName}
                             placeholder="选择私钥文件"
                             readOnly
                             onClick={() => document.getElementById('sshKeyFile').click()}
                         />
                         <button 
                             className="btn file-select-btn"
                             onClick={() => document.getElementById('sshKeyFile').click()}
                         >
                             选择文件
                         </button>
                     </div>
                 </div>
                 <div className="form-group">
                     <label>SSH Host:</label>
                     <input 
                         id="sshHost" 
                         className="input" 
                         onChange={handleInputChange} 
                         value={formData.sshHost}
                         autoComplete="off" 
                         name="sshHost" 
                         type="text"
                     />
                 </div>
                 <div className="form-group">
                     <label>SSH端口:</label>
                     <input 
                         id="sshPort" 
                         className="input" 
                         onChange={handleInputChange} 
                         value={formData.sshPort}
                         autoComplete="off" 
                         name="sshPort" 
                         type="number"
                         min="1"
                         max="65535"
                     />
                 </div>
                 <div className="form-group">
                     <label>SSH用户名:</label>
                     <input 
                         id="sshUser" 
                         className="input" 
                         onChange={handleInputChange} 
                         value={formData.sshUser}
                         autoComplete="off" 
                         name="sshUser" 
                         type="text"
                     />
                 </div>
                 <div className="form-group">
                     <label>SOCKS5服务端端口:</label>
                     <input 
                         id="socks5Port" 
                         className="input" 
                         onChange={handleInputChange} 
                         value={formData.socks5Port}
                         autoComplete="off" 
                         name="socks5Port" 
                         type="number"
                         min="1"
                         max="65535"
                     />
                 </div>
                 <div className="form-group">
                     <label>开启状态:</label>
                     <div className="status-buttons">
                         <button className="btn" onClick={() => handleToggle('开启')}>开启</button>
                         <button className="btn" onClick={() => handleToggle('关闭')}>关闭</button>
                     </div>
                 </div>
                 <div className="status-display">
                     <div className="status-indicator">
                         <div className={`status-dot ${formData.isOpen ? 'active' : ''}`}></div>
                         <span>{formData.isOpen ? '已开启' : '已关闭'}</span>
                     </div>
                     {formData.isOpen && formData.socks5Port && (
                         <div className="port-number active">
                             SOCKS5端口: {formData.socks5Port}
                         </div>
                     )}
                 </div>
            </div>
        </div>
    )
}

export default App

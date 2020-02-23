/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

// curl test
// curl -X POST -d "{\"title\": \"Here's To You\",\"body\": \"123\"}" -H 'Authorization: token 【token】' https://api.github.com/repos/yes1am/PiggyBank/issues -H 'Content-Type: application/json'

import React from 'react';
import axios from 'axios';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TextInput,
  Button,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';

const GITHUB_REPO = 'PiggyBank';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.timer = null;
    const {sharedUrl} = this.props;
    this.state = {
      sharedUrl,
      preSharedUrl: sharedUrl || 'eg: example.com',
      token: '',
      message: '',
      loading: false,
      title: '',
    };
  }

  componentDidMount() {
    this.saveUrlRemote();
    this.getStorage('token').then(token => {
      if (token) {
        this.setState({token});
      }
    });
  }

  async getTitleFromUrl(url) {
    if (!url) {
      this.showMessage('getTitleFromUrl 失败, url 不能为空');
      return '';
    }
    try {
      this.showMessage('正在加载 title...', false);
      this.setState({
        loading: true,
      });
      const res = await axios({
        url,
        method: 'get',
      });
      this.setState({
        loading: false,
      });

      if (res && res.data) {
        const matches = res.data.match('<title.*>((.|\n)*)</title>');
        const title = matches ? matches[1].trim() : '';
        if (title) {
          this.setState({
            title,
          });
          console.log('title:', title);
          this.showMessage('获取 title 成功');
        } else {
          this.showMessage('解析 title 失败，正则匹配无结果，请手动输入 title');
        }
        return title;
      }
      this.showMessage('获取 title 失败, 请手动输入 title');
      return '';
    } catch (e) {
      console.log(`getTitleFromUrl: ${url} error,`, e);
      this.showMessage('获取 title 失败, 请手动输入 title');
      this.setState({
        loading: false,
      });
      return '';
    }
  }

  async saveUrlRemote() {
    let {sharedUrl, title, token: stateToken} = this.state;
    if (!sharedUrl) {
      return this.showMessage('请先填入 url');
    }
    const token = (await this.getStorage('token')) || stateToken;
    if (!token) {
      return this.showMessage('请先填入 token');
    }

    if (!title) {
      title = await this.getTitleFromUrl(sharedUrl);
    }

    if (!title) {
      return;
    }

    console.log(`saveUrlRemote start: url:${sharedUrl}, title: ${title}`);
    this.setState({
      loading: true,
      message: '正在保存...',
    });

    axios({
      method: 'post',
      url: `https://api.github.com/repos/yes1am/${GITHUB_REPO}/issues`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${token}`,
      },
      data: {
        title,
        body: sharedUrl,
      },
    })
      .then(response => {
        if (response.data) {
          console.log('saveUrlRemote success!');
          this.setState({
            loading: false,
            sharedUrl: '',
            title: '',
            preSharedUrl: sharedUrl,
          });
          this.showMessage('发送至 Github 成功');
        }
      })
      .catch(err => {
        console.log('err', err);
        this.setState({
          loading: false,
        });
        this.showMessage(
          `发送至 Github 失败: ${err.toString()}, with token, ${token}`,
        );
      });
  }

  async setStorage({key, value}, callback) {
    try {
      await AsyncStorage.setItem(key, value, () => {
        if (callback) {
          callback();
        }
      });
    } catch (error) {
      console.log(`setStorage error, for key=${key}, value=${value}`);
    }
  }

  async getStorage(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return value;
      }
    } catch (error) {
      console.log(`getStorage error, for key=${key}`);
    }
  }

  onChangeToken(token) {
    this.setState({
      token,
    });
  }

  onSaveToken() {
    const {token} = this.state;
    this.setStorage({key: 'token', value: token}, () => {
      this.showMessage('保存 token 成功');
    });
  }

  showMessage(message = 'success', autoClear = true, duration = 1500) {
    this.setState({
      message,
    });
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (autoClear) {
        this.setState({
          message: '',
        });
      }
    }, duration);
  }

  onURLChange(sharedUrl) {
    this.setState({
      sharedUrl,
    });
  }

  onTitleChange(title) {
    this.setState({
      title,
    });
  }

  render() {
    const {
      sharedUrl,
      preSharedUrl,
      token,
      message,
      loading,
      title,
    } = this.state;
    return (
      <>
        {/* 状态栏，信号，电量 */}
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <TextInput
              onChangeText={token => this.onChangeToken(token)}
              placeholder="token"
              value={token}
            />
            <Button
              onPress={() => this.onSaveToken()}
              title="save token"
              color="#ff4d4f"
            />
            <View style={styles.body}>
              {!!preSharedUrl && (
                <>
                  <Text>Previous Send</Text>
                  <TextInput editable={false} value={preSharedUrl} />
                </>
              )}
              <Text>Share</Text>
              <TextInput
                placeholder="title"
                onChangeText={title => this.onTitleChange(title)}
                value={title}
              />
              <TextInput
                placeholder="url"
                onChangeText={sharedUrl => this.onURLChange(sharedUrl)}
                value={sharedUrl}
              />
            </View>
            <Button
              onPress={() => this.saveUrlRemote()}
              title="Share"
              color="#1890ff"
              disabled={loading}
            />
            {!!message && <Text style={styles.message}> {message} </Text>}
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#F3F3F3',
  },
  body: {
    backgroundColor: '#FFF',
  },
  message: {
    textAlign: 'center',
    color: 'red',
    backgroundColor: '#fff',
    lineHeight: 40,
  },
});

export default App;

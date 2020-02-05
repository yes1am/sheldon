/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

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

async function getTitleFromUrl(url) {
  if (!url) {
    return '';
  }
  try {
    const res = await axios({
      url,
      method: 'get',
    });
    if (res && res.data) {
      const title = res.data.match('<title.*>(.*)</title>')[1];
      return title;
    }
    return '';
  } catch (e) {
    console.log(`getTitleFromUrl: ${url} error,`, e);
    return '';
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sharedUrl: '',
      token: '',
      info: '',
    };
    this.timer = null;
    const {sharedUrl} = this.props;
    if (sharedUrl) {
      this.saveUrlRemote();
    }
  }

  componentDidMount() {
    this.getStorage('token').then(token => {
      this.setState({token});
    });
  }

  async saveUrlRemote() {
    const {sharedUrl} = this.props;
    const token = await this.getStorage('token');
    if (!token) {
      return;
    }
    console.log('start saveUrlRemote:', sharedUrl);
    const title = await getTitleFromUrl(sharedUrl);
    if (!title) {
      return;
    }
    axios({
      method: 'post',
      url: 'https://api.github.com/repos/yes1am/PiggyBank/issues',
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
          console.log('success');
          this.showSuccessInfo('发送到 github 成功');
        }
      })
      .catch(err => {
        console.log('err', err);
        this.showSuccessInfo('发送到 github 失败');
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
    this.setState({token});
  }

  onSaveToken() {
    const {token} = this.state;
    this.setStorage({key: 'token', value: token}, () => {
      this.showSuccessInfo('保存 token 成功');
    });
  }

  showSuccessInfo(successInfo = 'success', duration = 1500) {
    this.setState({
      info: successInfo,
    });
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.setState({
        info: '',
      });
    }, duration);
  }

  render() {
    const {sharedUrl, token, info} = this.state;
    return (
      <>
        {/* 状态栏，信号，电量 */}
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <TextInput
              style={styles.tokenInput}
              onChangeText={token => this.onChangeToken(token)}
              placeholder="token"
              value={token}
            />
            <View style={styles.body}>
              {sharedUrl ? (
                <Text> receive {sharedUrl}</Text>
              ) : (
                <Text> 暂无分享链接 </Text>
              )}
            </View>
            {!!info && <Text> {info} </Text>}
            <Button
              onPress={() => this.onSaveToken()}
              title="save token"
              color="#841584"
            />
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
  center: {
    textAlign: 'center',
  },
  tokenInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
  },
});

export default App;

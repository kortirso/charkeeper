# frozen_string_literal: true

describe Web::WelcomeController do
  describe 'GET#index' do
    it 'returns data' do
      get :index

      expect(response).to have_http_status :ok
    end
  end

  describe 'GET#privacy' do
    it 'returns data' do
      get :privacy

      expect(response).to have_http_status :ok
    end
  end

  describe 'GET#bot_commands' do
    it 'returns data' do
      get :bot_commands

      expect(response).to have_http_status :ok
    end
  end

  describe 'GET#tips' do
    it 'returns data' do
      get :tips

      expect(response).to have_http_status :ok
    end
  end

  describe 'GET#changelogs' do
    it 'returns data' do
      get :changelogs

      expect(response).to have_http_status :ok
    end
  end

  describe 'GET#too_many_requests' do
    it 'returns data' do
      get :too_many_requests

      expect(response).to have_http_status :ok
    end
  end
end

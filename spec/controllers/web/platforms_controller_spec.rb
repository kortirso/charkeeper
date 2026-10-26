# frozen_string_literal: true

describe Web::PlatformsController do
  describe 'GET#pathfinder2' do
    it 'returns data' do
      get :pathfinder2

      expect(response).to have_http_status :ok
    end
  end

  describe 'GET#cosmere' do
    it 'returns data' do
      get :cosmere

      expect(response).to have_http_status :ok
    end
  end

  describe 'GET#nimble' do
    it 'returns data' do
      get :nimble

      expect(response).to have_http_status :ok
    end
  end
end

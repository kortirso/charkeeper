# frozen_string_literal: true

describe 'Welcome' do
  describe 'GET#index' do
    it 'renders index page' do
      get '/adminbook'

      expect(response).to have_http_status :ok
    end
  end
end

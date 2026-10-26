# frozen_string_literal: true

describe Web::WelcomeController do
  render_views

  describe 'GET#index' do
    it 'returns data' do
      get :index

      expect(response).to have_http_status :ok
    end

    it 'renders canonical and localized alternate URLs' do
      get :index, params: { locale: :ru, close_cookie_banner: true }

      page = response.parsed_body

      expect(
        canonical: page.at_css('link[rel="canonical"]')['href'],
        alternates: page.css('link[rel="alternate"]').to_h { |link| [link['hreflang'], link['href']] }
      ).to eq(
        canonical: 'https://charkeeper.org/ru',
        alternates: {
          'en' => 'https://charkeeper.org/',
          'ru' => 'https://charkeeper.org/ru',
          'es' => 'https://charkeeper.org/es',
          'en-RU' => 'https://charkeeper.ru/en',
          'ru-RU' => 'https://charkeeper.ru/',
          'es-RU' => 'https://charkeeper.ru/es',
          'x-default' => 'https://charkeeper.org/'
        }
      )
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

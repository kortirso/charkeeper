# frozen_string_literal: true

Rails.application.routes.draw do
  get 'web_telegram', to: 'web_telegram#index'

  namespace :api do
    namespace :v1 do
      namespace :auth do
        resources :web_telegram, only: %i[create]
      end

      resources :rules, only: %i[index]
      resources :characters, only: %i[index show] do
        resources :items, only: %i[index], module: 'characters'
      end
    end
  end

  scope module: :web do
    resources :characters, only: %i[index]
  end

  root 'web/welcome#index'
end

# frozen_string_literal: true

Rails.application.routes.draw do
  get 'web_telegram', to: 'web_telegram#index'

  namespace :web_telegram do
    resources :auth, only: %i[create]
    resources :characters, only: %i[index show destroy] do
      resources :notes, only: %i[index create destroy], module: 'characters'
    end

    namespace :dnd5 do
      resources :characters, only: %i[create update] do
        resources :items, only: %i[index create update destroy], module: 'characters'
        resources :spells, only: %i[index create update destroy], module: 'characters'
        resources :rest, only: %i[create], module: 'characters'
      end
      resources :items, only: %i[index]
      resources :spells, only: %i[index]
    end
  end

  root 'web/welcome#index'
end

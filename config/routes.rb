# frozen_string_literal: true

Rails.application.routes.draw do
  get 'web_telegram', to: 'web_telegram#index'

  namespace :adminbook do
    resources :users, only: %i[index]
    resources :characters, only: %i[index]

    namespace :characters do
      namespace :dnd5 do
        resources :features, except: %i[show]
      end
      namespace :dnd2024 do
        resources :features, except: %i[show]
      end
    end

    get '/', to: 'welcome#index'
  end

  namespace :web_telegram do
    resources :auth, only: %i[create]
    resources :characters, only: %i[index show destroy] do
      resources :notes, only: %i[index create destroy], module: 'characters'
    end
    resource :users, only: %i[update]

    namespace :dnd5 do
      resources :characters, only: %i[create update] do
        resources :items, only: %i[index create update destroy], module: 'characters'
        resources :spells, only: %i[index create update destroy], module: 'characters'
        resources :rest, only: %i[create], module: 'characters'
        resources :health, only: %i[create], module: 'characters'
      end
      resources :items, only: %i[index]
      resources :spells, only: %i[index]
    end

    namespace :dnd2024 do
      resources :characters, only: %i[create update] do
        resources :spells, only: %i[index create update destroy], module: 'characters'
        resources :rest, only: %i[create], module: 'characters'
      end
      resources :spells, only: %i[index]
    end

    namespace :pathfinder2 do
      resources :characters, only: %i[create update]
    end

    namespace :daggerheart do
      resources :characters, only: %i[create update]
    end
  end

  namespace :webhooks do
    resource :telegram, only: %i[create]
  end

  root 'web/welcome#index'
end

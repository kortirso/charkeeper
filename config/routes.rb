# frozen_string_literal: true

Rails.application.routes.draw do
  mount SolidErrors::Engine, at: '/solid_errors'

  get 'web_telegram', to: 'web_telegram#index'

  namespace :adminbook do
    namespace :users do
      resources :notifications, except: %i[show]
      resources :identities, only: %i[index]
      resources :platforms, only: %i[index]
    end
    resources :users, only: %i[index]
    resources :feedbacks, only: %i[index]
    resources :notifications, only: %i[index new create]

    namespace :dnd5 do
      resources :characters, only: %i[index]
    end
    namespace :dnd2024 do
      resources :characters, only: %i[index]
    end
    namespace :pathfinder2 do
      resources :characters, only: %i[index]
    end
    namespace :daggerheart do
      resources :characters, only: %i[index]
    end

    resources :items, except: %i[show]
    resources :spells, except: %i[show]
    resources :feats, except: %i[show]

    get '/', to: 'welcome#index'
  end

  namespace :frontend do
    namespace :homebrews do
      scope ':provider' do
        resources :races, only: %i[index create destroy]
        resources :feats, only: %i[index create destroy]
        resources :items, only: %i[index create destroy]
        resources :specialities, only: %i[index create destroy]
      end

      get ':provider', to: 'list#index'
    end
    resources :homebrews, only: %i[index]

    scope module: :users do
      resources :signin, only: %i[create]
      resources :signup, only: %i[create]
    end

    resources :auth, only: %i[create]
    resources :characters, only: %i[index show destroy] do
      resources :notes, only: %i[index create destroy], module: 'characters'

      scope ':provider' do
        resources :items, only: %i[index create update destroy], module: 'characters'
        resources :bonuses, only: %i[index create destroy], module: 'characters'
        resources :feats, only: %i[update], module: 'characters'
      end
    end

    get ':provider/items', to: 'items#index'
    resource :users, only: %i[update] do
      resources :feedbacks, only: %i[create], module: 'users'
      resources :notifications, only: %i[index], module: 'users' do
        get 'unread', on: :collection
      end
      resources :monitoring, only: %i[create], module: 'users'
      resource :info, only: %i[show], module: 'users'
    end

    namespace :dnd5 do
      resources :characters, only: %i[create update] do
        resources :spells, only: %i[index create update destroy], module: 'characters'
        resources :rest, only: %i[create], module: 'characters'
        resources :health, only: %i[create], module: 'characters'
      end
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
      resources :characters, only: %i[create update] do
        resources :health, only: %i[create], module: 'characters'
      end
    end

    namespace :daggerheart do
      resources :characters, only: %i[create update] do
        resources :spells, only: %i[index create update destroy], module: 'characters'
        resources :rest, only: %i[create], module: 'characters'
        resource :companions, only: %i[show create update destroy], module: 'characters'
      end
      resources :spells, only: %i[index]
    end

    resources :campaigns, only: %i[index show create destroy]
  end

  namespace :webhooks do
    resource :telegram, only: %i[create]
  end

  scope '(:locale)', locale: /#{I18n.available_locales.join('|')}/, defaults: { locale: nil } do
    scope module: :web do
      get 'auth/:provider/callback', to: 'users/omniauth_callbacks#create'

      scope module: :users do
        resources :signin, only: %i[new create]
        resources :signup, only: %i[new create]

        get 'logout', to: 'signin#destroy'
      end

      resource :dashboard, only: %i[show]
      resources :characters, only: %i[show]
    end

    root 'web/welcome#index'
  end
end

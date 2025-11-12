# frozen_string_literal: true

Rails.application.routes.draw do
  mount SolidErrors::Engine, at: '/solid_errors'
  mount GoodJob::Engine => 'good_job'
  mount PgHero::Engine, at: 'pghero'

  get 'web_telegram', to: 'web_telegram#index'

  namespace :adminbook do
    namespace :users do
      resources :notifications, except: %i[show]
      resources :identities, only: %i[index]
      resources :platforms, only: %i[index]
    end
    resources :campaigns, only: %i[index]
    resources :users, only: %i[index]
    resources :feedbacks, only: %i[index]
    resources :notifications, only: %i[index new create]

    namespace :dc20 do
      resources :characters, only: %i[index]
    end
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

      namespace :homebrew do
        resources :books, only: %i[index]
        resources :races, only: %i[index]
        resources :communities, only: %i[index]
        resources :transformations, only: %i[index]
        resources :domains, only: %i[index]
        resources :specialities, only: %i[index]
        resources :subclasses, only: %i[index]
        resources :feats, only: %i[index]
        resources :items, only: %i[index]
      end
    end

    resources :items, except: %i[show]
    resources :spells, except: %i[show]
    resources :feats, except: %i[show]

    get '/', to: 'welcome#index'
  end

  namespace :frontend do
    resources :bots, only: %i[create]
    namespace :homebrews do
      scope ':provider' do
        resources :books, only: %i[index]
        resources :races, only: %i[index create destroy] do
          resource :copy, only: %i[create], module: :races
        end
        resources :feats, only: %i[index create destroy]
        resources :items, only: %i[index create destroy] do
          resource :copy, only: %i[create], module: :items
        end
        resources :specialities, only: %i[index create destroy]
        resources :subclasses, only: %i[create destroy] do
          resource :copy, only: %i[create], module: :subclasses
        end
        resources :communities, only: %i[destroy] do
          resource :copy, only: %i[create], module: :communities
        end
        resources :transformations, only: %i[destroy] do
          resource :copy, only: %i[create], module: :transformations
        end
        resources :domains, only: %i[destroy] do
          resource :copy, only: %i[create], module: :domains
        end
      end

      get ':provider', to: 'list#index'
    end
    resources :homebrews, only: %i[index]

    scope module: :users do
      resource :signin, only: %i[create destroy]
      resources :signup, only: %i[create]
    end

    resources :auth, only: %i[create]
    resources :characters, only: %i[index show destroy] do
      resources :notes, only: %i[index create update destroy], module: 'characters'

      scope ':provider' do
        resources :items, only: %i[index create update destroy], module: 'characters'
        resources :bonuses, only: %i[index create destroy], module: 'characters'
        resources :feats, only: %i[update], module: 'characters'
      end
    end

    get ':provider/items', to: 'items#index'
    namespace :info do
      resources :items, only: %i[show]
    end
    resource :users, only: %i[update destroy] do
      resources :identities, only: %i[destroy], module: 'users'
      resources :feedbacks, only: %i[create], module: 'users'
      resources :books, only: %i[update], module: 'users'
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

    namespace :dc20 do
      resources :characters, only: %i[create update]
    end

    scope ':provider' do
      namespace :tags do
        scope ':type' do
          get ':id', action: :show
        end
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

    resources :campaigns, only: %i[index show create destroy] do
      resource :join, only: %i[show create destroy], module: :campaigns
    end
  end

  namespace :homebrews do
    namespace :daggerheart do
      resources :ancestries, only: %i[index show create update destroy]
      resources :communities, only: %i[index show create update destroy]
      resources :feats, only: %i[index create destroy]
    end
  end

  namespace :webhooks do
    resource :telegram, only: %i[create]
    resource :discord, only: %i[create]
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
      resource :homebrews, only: %i[show]
      resources :characters, only: %i[show]

      resources :campaigns, only: %i[] do
        resource :join, only: %i[show], module: :campaigns
      end

      get 'privacy', to: 'welcome#privacy'
      get 'bot_commands', to: 'welcome#bot_commands'
      get 'tips', to: 'welcome#tips'
    end

    root 'web/welcome#index'
  end
end

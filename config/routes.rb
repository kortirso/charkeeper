# frozen_string_literal: true

Rails.application.routes.draw do
  get 'web_telegram', to: 'web_telegram#index'

  namespace :web_telegram do
    resources :auth, only: %i[create]
    resources :rules, only: %i[index]
    resources :characters, only: %i[index show] do
      resources :items, only: %i[index], module: 'characters'
      resources :spells, only: %i[index], module: 'characters'
    end
  end

  scope module: :web do
    resources :characters, only: %i[index]
  end

  root 'web/welcome#index'
end

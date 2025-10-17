# frozen_string_literal: true

module Web
  class DashboardsController < Web::BaseController
    include Authkeeper::ApplicationHelper

    layout 'charkeeper_app'

    def show
      @access_token = cookies[Authkeeper.configuration.access_token_name]
      @identities = current_user.identities.hashable_pluck(:id, :uid, :provider)
      @oauth_links = {
        google: omniauth_link(:google),
        discord: omniauth_link(:discord)
      }
      @oauth_credentials = {
        telegram: {
          bot_name: Rails.application.credentials.dig(Rails.env.to_sym, :oauth, :telegram, :bot_name),
          redirect_url: Rails.application.credentials.dig(Rails.env.to_sym, :oauth, :telegram, :redirect_url)
        }
      }
    end
  end
end

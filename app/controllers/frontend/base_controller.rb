# frozen_string_literal: true

module Frontend
  class BaseController < ApplicationController
    protect_from_forgery with: :null_session

    before_action :set_active_storage_url_options

    private

    def set_active_storage_url_options
      return if Rails.env.production?

      ActiveStorage::Current.url_options = {
        protocol: request.protocol,
        host: request.host,
        port: request.port
      }
    end

    def only_head_response
      render json: { result: :ok }, status: :ok
    end

    def access_denied
      render json: { errors: [t('forbidden')], errors_list: [t('forbidden')] }, status: :forbidden, formats: [:json] # 403
    end

    def page_not_found
      render json: { errors: [t('not_found')], errors_list: [t('not_found')] }, status: :not_found # 404
    end

    def unprocessable_response(errors, errors_list=[])
      render json: { errors: errors, errors_list: errors_list }, status: :unprocessable_content # 422
    end
  end
end

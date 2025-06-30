# frozen_string_literal: true

module Frontend
  class BaseController < ApplicationController
    protect_from_forgery with: :null_session

    rescue_from ActiveRecord::RecordNotFound, with: :page_not_found

    private

    def only_head_response
      render json: { result: :ok }, status: :ok
    end

    def page_not_found
      render json: { errors: [t('not_found')] }, status: :not_found
    end

    def unprocessable_response(errors)
      render json: { errors: errors }, status: :unprocessable_entity
    end
  end
end

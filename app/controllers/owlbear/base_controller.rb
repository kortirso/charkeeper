# frozen_string_literal: true

module Owlbear
  class BaseController < ApplicationController
    protect_from_forgery with: :null_session

    skip_before_action :authenticate
    skip_before_action :set_locale

    private

    def page_not_found
      render json: { errors: [t('not_found')] }, status: :not_found # 404
    end
  end
end

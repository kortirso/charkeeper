# frozen_string_literal: true

module Adminbook
  module Users
    class IdentitiesController < Adminbook::BaseController
      def index
        @pagy, @identities = pagy(User::Identity.order(created_at: :desc), limit: 25)
      end
    end
  end
end

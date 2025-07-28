# frozen_string_literal: true

module Adminbook
  module Users
    class IdentitiesController < Adminbook::BaseController
      def index
        @identities = User::Identity.order(created_at: :desc)
      end
    end
  end
end

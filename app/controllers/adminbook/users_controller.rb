# frozen_string_literal: true

module Adminbook
  class UsersController < Adminbook::BaseController
    def index
      @users = User.includes(:identities).order(created_at: :asc)
    end
  end
end

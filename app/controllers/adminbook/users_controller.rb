# frozen_string_literal: true

module Adminbook
  class UsersController < Adminbook::BaseController
    def index
      @users = User.includes(:identities)
    end
  end
end

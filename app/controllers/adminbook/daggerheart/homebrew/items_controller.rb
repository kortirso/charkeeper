# frozen_string_literal: true

module Adminbook
  module Daggerheart
    module Homebrew
      class ItemsController < Adminbook::BaseController
        def index
          @pagy, @items = pagy(::Daggerheart::Item.where.not(user_id: nil).order(created_at: :desc), limit: 25)
        end
      end
    end
  end
end

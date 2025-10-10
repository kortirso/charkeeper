# frozen_string_literal: true

module Adminbook
  module Daggerheart
    module Homebrew
      class BooksController < Adminbook::BaseController
        def index
          @pagy, @books = pagy(::Homebrew::Book.where(provider: 'daggerheart').order(created_at: :desc), limit: 25)
        end
      end
    end
  end
end

# frozen_string_literal: true

module Adminbook
  module Daggerheart
    module Homebrew
      class FeatsController < Adminbook::BaseController
        def index
          @pagy, @feats = pagy(::Daggerheart::Feat.where.not(user_id: nil).order(created_at: :desc), limit: 25)
        end
      end
    end
  end
end

# frozen_string_literal: true

module Adminbook
  module Daggerheart
    module Homebrew
      class DomainsController < Adminbook::BaseController
        def index
          @pagy, @domains = pagy(::Daggerheart::Homebrews::Domain.order(created_at: :desc), limit: 25)
        end
      end
    end
  end
end

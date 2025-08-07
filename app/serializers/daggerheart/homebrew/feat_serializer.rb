# frozen_string_literal: true

module Daggerheart
  module Homebrew
    class FeatSerializer < ApplicationSerializer
      attributes :id, :title, :description, :origin, :origin_value, :kind, :limit, :limit_refresh, :conditions

      def limit
        object.description_eval_variables['limit']
      end
    end
  end
end

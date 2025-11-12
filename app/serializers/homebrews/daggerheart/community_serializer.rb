# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class CommunitySerializer < ApplicationSerializer
      attributes :id, :name, :features

      def features
        context && context[:features] ? context[:features].select { |i| i.origin_value == object.id } : []
      end
    end
  end
end

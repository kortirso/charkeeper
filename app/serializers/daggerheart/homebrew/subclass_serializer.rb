# frozen_string_literal: true

module Daggerheart
  module Homebrew
    class SubclassSerializer < ApplicationSerializer
      attributes :id, :name, :class_name

      def name
        translate(object.title)
      end

      def class_name
        object.info.class_id
      end
    end
  end
end

# frozen_string_literal: true

module Daggerheart
  module Homebrew
    class SubclassSerializer < ApplicationSerializer
      attributes :id, :name, :class_name
    end
  end
end

# frozen_string_literal: true

module Daggerheart
  module Homebrew
    class ItemSerializer < ApplicationSerializer
      attributes :id, :name, :kind
    end
  end
end

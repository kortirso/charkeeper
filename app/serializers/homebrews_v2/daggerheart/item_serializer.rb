# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class ItemSerializer < ApplicationSerializer
      attributes :id, :info, :kind
    end
  end
end

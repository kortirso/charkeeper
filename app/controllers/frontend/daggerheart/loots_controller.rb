# frozen_string_literal: true

module Frontend
  module Daggerheart
    class LootsController < Frontend::Daggerheart::BaseController
      include SerializeResource

      def create
        serialize_resource(::Daggerheart::Item.loot(type: params[:type], dices: params[:dices]), ::ItemSerializer, :item)
      end
    end
  end
end

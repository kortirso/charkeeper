# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class FeatsController < Homebrews::FeatsController
      include Deps[
        add_feat: 'commands.homebrew_context.daggerheart.add_feat',
        change_feat: 'commands.homebrew_context.daggerheart.change_feat'
      ]

      private

      def find_feats
        @feats = ::Daggerheart::Feat.where(user_id: current_user.id)
      end

      def find_feat
        @feat = ::Daggerheart::Feat.find_by!(id: params[:id], user_id: current_user.id)
      end

      def create_params
        params.require(:brewery).permit!.to_h
      end

      def bonuses_params
        params.permit![:bonuses].to_a.map { |item| item.to_h.deep_symbolize_keys }
      end

      def serializer = ::Daggerheart::Homebrew::FeatSerializer
    end
  end
end

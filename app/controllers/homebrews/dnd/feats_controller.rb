# frozen_string_literal: true

module Homebrews
  module Dnd
    class FeatsController < Homebrews::FeatsController
      include Deps[
        add_feat: 'commands.homebrew_context.dnd.feats.add',
        change_feat: 'commands.homebrew_context.dnd.feats.change'
      ]

      private

      def find_feats
        @feats = ::Dnd2024::Feat.where(user_id: current_user.id, origin: 4)
      end

      def find_feat
        @feat = ::Dnd2024::Feat.find_by!(id: params[:id], user_id: current_user.id)
      end

      def create_params
        params.require(:brewery).permit!.to_h
      end

      def bonuses_params
        {}
      end

      def serializer = ::Homebrews::FeatSerializer
    end
  end
end

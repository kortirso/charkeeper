# frozen_string_literal: true

module Homebrews
  module Dnd
    class SpellsController < Homebrews::BaseController
      include Deps[
        add_spell: 'commands.homebrew_context.dnd.spells.add'
      ]
      include SerializeRelation
      include SerializeResource

      before_action :find_spells, only: %i[index]
      before_action :find_spell, only: %i[show destroy]

      def index
        serialize_relation(@spells, ::Homebrews::FeatSerializer, :spells, {}, { current_user_id: current_user.id })
      end

      def show
        serialize_resource(@spell, ::Homebrews::FeatSerializer, :spell, {}, :ok, { current_user_id: current_user.id })
      end

      def create
        case add_spell.call(spell_params.merge(user: current_user))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(
            result, ::Homebrews::FeatSerializer, :spell, {}, :created, { current_user_id: current_user.id }
          )
        end
      end

      def destroy
        @spell.destroy
        only_head_response
      end

      private

      def find_spells
        @spells =
          ::Dnd2024::Feat.where(user_id: current_user.id, origin: 6)
            .or(
              ::Dnd2024::Feat.where.not(user_id: current_user.id).where(public: true, origin: 6)
            ).order(created_at: :desc)
      end

      def find_spell
        @spell = ::Dnd2024::Feat.find_by!(id: params[:id], user_id: current_user.id, origin: 6)
      end

      def spell_params
        params.require(:brewery).permit!.to_h
      end
    end
  end
end

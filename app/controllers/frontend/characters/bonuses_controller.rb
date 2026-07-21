# frozen_string_literal: true

module Frontend
  module Characters
    class BonusesController < Frontend::BaseController
      include Deps[
        feature_requirement: 'feature_requirement',
        add_dnd_bonus_v2: 'commands.characters_context.dnd2024.bonuses.add',
        add_dnd_bonus_v3: 'commands.characters_context.dnd2024.bonuses.add_v3',
        add_daggerheart_bonus_v2: 'commands.characters_context.daggerheart.bonuses.add',
        add_daggerheart_companion_bonus: 'commands.characters_context.daggerheart.bonuses.add_companion',
        change_command: 'commands.bonuses_context.change',
        add_dc20_bonus: 'commands.characters_context.dc20.bonuses.add',
        add_pathfinder2_bonus: 'commands.characters_context.pathfinder2.bonuses.add',
        add_cosmere_bonus: 'commands.characters_context.cosmere.bonuses.add'
      ]
      include SerializeRelation
      include SerializeResource

      before_action :find_character
      before_action :find_character_bonus, only: %i[update destroy]
      before_action :find_bonus_command, only: %i[create]
      before_action :validate_create_command, only: %i[create]

      def index
        serialize_relation(bonuses, ::Characters::BonusSerializer, :bonuses)
      end

      def create
        case @bonus_command.call(create_params.merge(bonusable: @character))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Characters::BonusSerializer, :bonus, {}, :created)
        end
      end

      def update
        case change_command.call(update_params.merge(character_bonus: @character_bonus))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else only_head_response
        end
      end

      def destroy
        @character_bonus.destroy
        only_head_response
      end

      private

      def find_character
        @character = characters_relation.find(params.expect(:character_id))
      end

      def find_character_bonus
        @character_bonus = @character.bonuses.find(params.expect(:id))
      end

      def bonuses
        @character.bonuses.order(created_at: :desc)
      end

      def characters_relation # rubocop: disable Metrics/AbcSize
        case params[:provider]
        when 'dnd5', 'dnd2024' then authorized_scope(Character.all).dnd
        when 'pathfinder2' then authorized_scope(Character.all).pathfinder2
        when 'daggerheart' then authorized_scope(Character.all).daggerheart
        when 'daggerheart_companion'
          ::Daggerheart::Character::Companion.joins(:character).where(characters: { user_id: current_user.id })
        when 'dc20' then authorized_scope(Character.all).dc20
        when 'cosmere' then authorized_scope(Character.all).cosmere
        else Character.none
        end
      end

      def find_bonus_command # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
        @bonus_command =
          if feature_requirement.call(current: params[:version], initial: '0.5.1')
            case params[:provider]
            when 'dc20' then add_dc20_bonus
            end
          elsif feature_requirement.call(current: params[:version], initial: '0.4.16')
            case params[:provider]
            when 'dnd2024' then add_dnd_bonus_v3
            when 'daggerheart_companion' then add_daggerheart_companion_bonus
            when 'pathfinder2' then add_pathfinder2_bonus
            when 'cosmere' then add_cosmere_bonus
            end
          elsif feature_requirement.call(current: params[:version], initial: '0.3.23')
            case params[:provider]
            when 'dnd5' then add_dnd_bonus_v2
            when 'daggerheart' then add_daggerheart_bonus_v2
            end
          end
      end

      def validate_create_command
        return if @bonus_command

        unprocessable_response(
          [t('frontend.characters.bonuses.need_update')],
          [t('frontend.characters.bonuses.need_update')]
        )
      end

      def create_params
        params.require(:bonus).permit!.to_unsafe_hash.deep_symbolize_keys
      end

      def update_params
        params.require(:bonus).permit!.to_h
      end
    end
  end
end

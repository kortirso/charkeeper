# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddFeatCommand < BaseCommand
      include Deps[
        refresh_feats: 'services.characters_context.daggerheart.refresh_feats',
        refresh_user_data: 'services.homebrews_context.refresh_user_data'
      ]

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :homebrew_feat

        Origins = Dry::Types['strict.string'].enum('ancestry', 'class', 'subclass', 'community', 'character', 'transformation')
        Kinds = Dry::Types['strict.string'].enum('static', 'text')
        Limits = Dry::Types['strict.string'].enum('short_rest', 'long_rest', 'session')

        params do
          required(:user).filled(type?: ::User)
          required(:title).filled(:string, max_size?: 50)
          required(:description).filled(:string, max_size?: 500)
          required(:origin).filled(Origins)
          required(:origin_value).filled(:string)
          required(:kind).filled(Kinds)
          optional(:limit).filled(:integer, gteq?: 1)
          optional(:limit_refresh).filled(Limits)
          optional(:subclass_mastery).filled(:integer)
        end

        rule(:limit, :limit_refresh).validate(:check_all_or_nothing_present)
        rule(:origin, :origin_value, :user) do
          origin =
            case values[:origin]
            when 'ancestry'
              ::Daggerheart::Homebrew::Race.find_by(user_id: values[:user].id, id: values[:origin_value]) ||
                ::Daggerheart::Character.heritage_info(values[:origin_value])
            when 'community'
              ::Daggerheart::Homebrew::Community.find_by(user_id: values[:user].id, id: values[:origin_value]) ||
                ::Daggerheart::Character.community_info(values[:origin_value])
            when 'class'
              ::Daggerheart::Homebrew::Speciality.find_by(user_id: values[:user].id, id: values[:origin_value]) ||
                ::Daggerheart::Character.class_info(values[:origin_value])
            when 'subclass'
              ::Daggerheart::Homebrew::Subclass.find_by(user_id: values[:user].id, id: values[:origin_value])
            when 'transformation'
              ::Daggerheart::Homebrew::Transformation.find_by(user_id: values[:user].id, id: values[:origin_value])
            when 'character'
              values[:user].characters.daggerheart.find_by(id: values[:origin_value])
            end
          next if origin

          key(:origin).failure(:not_found)
        end
      end
      # rubocop: enable Metrics/BlockLength

      private

      def do_prepare(input)
        if input[:origin] == 'subclass' && input.key?(:subclass_mastery)
          input[:conditions] = { subclass_mastery: input[:subclass_mastery] }
        end
        input[:description_eval_variables] = { limit: input[:limit].to_s } if input.key?(:limit)
        input[:title] = { en: input[:title], ru: input[:title] }
        input[:description] = { en: input[:description], ru: input[:description] }
      end

      def do_persist(input)
        result = ::Daggerheart::Feat.create!(input.except(:limit, :subclass_mastery))

        input[:user].characters.daggerheart.find_each { |character| refresh_feats.call(character: character) }
        refresh_user_data.call(user: input[:user])

        { result: result }
      end
    end
  end
end

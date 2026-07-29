# frozen_string_literal: true

module CharactersContext
  module Dc20
    module Feats
      class AddCommand < BaseCommand
        use_contract do
          params do
            required(:character).filled(type?: ::Dc20::Character)
            required(:feat).filled(type?: ::Dc20::Feat)
            optional(:with_subfeats).filled(:bool)
          end
        end

        private

        def do_persist(input) # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity
          return { result: :ok } if ::Character::Feat.exists?(input.except(:with_subfeats))

          ActiveRecord::Base.transaction do
            ::Character::Feat.create!(
              input.except(:with_subfeats).merge(
                ready_to_use: true,
                used_count: 0,
                limit_refresh: ::Dc20::Feat.limit_refreshes[input[:feat].limit_refresh],
                tokens: input[:feat].tokens.nil? ? nil : 0
              )
            )

            input[:feat].info['rewrite']&.each { |key, value| input[:character].data[key] = value }
            input[:feat].info['increase']&.each { |key, value| input[:character].data[key] += value }
            input[:feat].info['merge']&.each do |key, values|
              attribute = input[:character].data[key]
              values.each do |value_key, value|
                attribute = attribute.merge({ attribute[value_key] => attribute[value_key] + value })
              end
            end

            if input[:feat].origin == 'class' && input[:feat].origin_value
              input[:character].data['classes'][input[:feat].origin_value] ||= 0
              input[:character].data['classes'][input[:feat].origin_value] += 1
            end

            input[:character].save!
          end

          if input[:character].data['classes'][input[:feat].origin_value] == 2
            Charkeeper::Container.resolve('commands.characters_context.dc20.feats.add').call({
              character: input[:character],
              feat: ::Dc20::Feat.where(origin: 2).find_by(origin_value: input[:feat].origin_value)
            })
          end
          input[:with_subfeats] && input[:feat].info['feats']&.each do |value|
            Charkeeper::Container.resolve('commands.characters_context.dc20.feats.add').call({
              character: input[:character],
              feat: ::Dc20::Feat.find_by(slug: value)
            })
          end

          { result: :ok }
        end
      end
    end
  end
end

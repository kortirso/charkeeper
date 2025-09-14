# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class CopyBookCommand < BaseCommand
      include Deps[
        copy_race: 'commands.homebrew_context.daggerheart.copy_race',
        copy_community: 'commands.homebrew_context.daggerheart.copy_community',
        copy_subclass: 'commands.homebrew_context.daggerheart.copy_subclass',
        copy_item: 'commands.homebrew_context.daggerheart.copy_item'
      ]

      use_contract do
        params do
          required(:book).filled(type?: ::Homebrew::Book)
          required(:user).filled(type?: ::User)
        end
      end

      private

      def do_prepare(input)
        object_items = input[:book].items.group_by(&:itemable_type).transform_values { |item| item.pluck(:itemable_id) }

        input[:race_ids] = object_items['Daggerheart::Homebrew::Race'] || []
        input[:community_ids] = object_items['Daggerheart::Homebrew::Community'] || []
        input[:subclass_ids] = object_items['Daggerheart::Homebrew::Subclass'] || []
        input[:item_ids] = object_items['Daggerheart::Item'] || []
      end

      def do_persist(input)
        ActiveRecord::Base.transaction do
          copy_races(input)
          copy_communities(input)
          copy_subclasses(input)
          copy_items(input)
        end

        { result: :ok }
      end

      def copy_races(input)
        ::Daggerheart::Homebrew::Race.where(id: input[:race_ids]).find_each do |race|
          copy_race.call(race: race, user: input[:user])
        end
      end

      def copy_communities(input)
        ::Daggerheart::Homebrew::Community.where(id: input[:community_ids]).find_each do |community|
          copy_community.call(community: community, user: input[:user])
        end
      end

      def copy_subclasses(input)
        ::Daggerheart::Homebrew::Subclass.where(id: input[:subclass_ids]).group_by(&:class_name).each do |_, values|
          class_name = nil
          values.each_with_index do |value, index|
            if index.zero?
              subclass = copy_subclass.call(subclass: value, user: input[:user])
              class_name = subclass[:result].class_name
            else
              copy_subclass.call(subclass: value, user: input[:user], class_name: class_name)
            end
          end
        end
      end

      def copy_items(input)
        ::Daggerheart::Item.where(id: input[:item_ids]).find_each do |item|
          copy_item.call(item: item, user: input[:user])
        end
      end
    end
  end
end
